--Psy-Frame Lord Zeta
function c13753034.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13753034,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,13753034)
	e1:SetTarget(c13753034.target)
	e1:SetOperation(c13753034.operation)
	c:RegisterEffect(e1)
	--salvage
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCountLimit(1)
	e3:SetTarget(c13753034.thtg)
	e3:SetOperation(c13753034.thop)
	c:RegisterEffect(e3)

end
function c13753034.filter(c)
	return c:IsPosition(POS_FACEUP_ATTACK) and bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)==SUMMON_TYPE_SPECIAL
	and c:IsAbleToRemove()
end
function c13753034.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c13753034.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13753034.filter,tp,0,LOCATION_MZONE,1,nil) end
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c13753034.filter,tp,0,LOCATION_MZONE,1,1,nil)
end
function c13753034.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if not c:IsRelateToEffect(e) or not tc:IsRelateToEffect(e) then return end
	if Duel.Remove(c,0,REASON_EFFECT+REASON_TEMPORARY)~=0 and Duel.Remove(tc,0,REASON_EFFECT+REASON_TEMPORARY)~=0 then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
		e1:SetReset(RESET_PHASE+PHASE_STANDBY,2)
		e1:SetLabelObject(tc)
		e1:SetCountLimit(1)
		e1:SetCondition(c13753034.rtcon)
		e1:SetOperation(c13753034.retop)
		Duel.RegisterEffect(e1,tp)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
		e1:SetReset(RESET_PHASE+PHASE_STANDBY,2)
		e1:SetLabelObject(c)
		e1:SetCountLimit(1)
		e1:SetCondition(c13753034.rtcon)
		e1:SetOperation(c13753034.retop)
		Duel.RegisterEffect(e1,tp)
	end
end
function c13753034.rtcon(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer()
end
function c13753034.retop(e,tp,eg,ep,ev,re,r,rp)
	Duel.ReturnToField(e:GetLabelObject())
end
function c13753034.discon(e,c)
	if e:GetLabelObject():IsLocation(LOCATION_REMOVED) then return true end
	return false
end
function c13753034.disop(e,tp)
	local dis1=bit.lshift(0x1,e:GetLabel())
	return dis1
end



function c13753034.thfilter(c)
	return c:IsCode(13753034) or c:IsCode(13753060) or c:IsCode(13753061) and c:IsAbleToHand()
end
function c13753034.thtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13753034.thfilter,tp,LOCATION_GRAVE,0,1,e:GetHandler()) 
	and e:GetHandler():IsAbleToDeck() end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_GRAVE)
end
function c13753034.thop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13753034.thfilter,tp,LOCATION_GRAVE,0,1,1,e:GetHandler())
	if Duel.SendtoDeck(e:GetHandler(),nil,2,REASON_EFFECT)~=0 and g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

