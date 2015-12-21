--森羅の仙樹 レギア
function c80800020.initial_effect(c)
	--deck check
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800020,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTarget(c80800020.target)
	e1:SetOperation(c80800020.operation)
	c:RegisterEffect(e1)
	--sort decktop
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800020,1))
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80800020.sdcon)
	e2:SetTarget(c80800020.sdtg)
	e2:SetOperation(c80800020.sdop)
	c:RegisterEffect(e2)
	--
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_CONFIRM_DECKTOP)
	e3:SetRange(LOCATION_DECK)
	e3:SetLabelObject(e2)
	e3:SetCondition(c80800020.chk)
	c:RegisterEffect(e3)
end
function c80800020.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
end
function c80800020.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)==0 then return end
	Duel.ConfirmDecktop(tp,1)
	local g=Duel.GetDecktopGroup(tp,1)
	local tc=g:GetFirst()
	if tc:IsRace(RACE_PLANT) and tc:IsAbleToHand() then
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(g,nil,REASON_EFFECT)
		Duel.BreakEffect()
		Duel.Draw(tp,1,REASON_EFFECT)
	else
		Duel.MoveSequence(tc,1)
	end
end
function c80800020.sdcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsPreviousLocation(LOCATION_DECK) 
	and	re==e:GetLabelObject()
end
function c80800020.sdtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
end
function c80800020.sdop(e,tp,eg,ep,ev,re,r,rp)
	local ct=Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)
	if ct==1 then 
		Duel.SortDecktop(tp,tp,1)
	else
		local ac=0
		Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(80800020,2))
		if ct==2 then ac=Duel.AnnounceNumber(tp,1,2)
		else ac=Duel.AnnounceNumber(tp,1,2,3) end
		Duel.SortDecktop(tp,tp,ac)
	end
end
function c80800020.chk(e,tp,eg,ep,ev,re,r,rp)
	if  eg:IsContains(e:GetHandler()) then
		e:GetLabelObject():SetLabelObject(re)
	end
end