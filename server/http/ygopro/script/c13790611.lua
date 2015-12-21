--Katangami - Shiranui
function c13790611.initial_effect(c)
	c:SetSPSummonOnce(13790611)
	--synchro summon
	aux.AddSynchroProcedure(c,c13790611.synfilter,aux.NonTuner(c13790611.synfilter),1)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(3603242,0))
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c13790611.destg)
	e1:SetOperation(c13790611.desop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(59281922,1))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_REMOVE)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e2:SetTarget(c13790611.target)
	e2:SetOperation(c13790611.operation)
	c:RegisterEffect(e2)
end
function c13790611.synfilter(c)
	return c:IsRace(RACE_ZOMBIE)
end
function c13790611.cfilter(c,tp)
	return c:IsRace(RACE_ZOMBIE) and c:IsFaceup() and c:IsAbleToDeck()
		and Duel.IsExistingTarget(c13790611.dfilter,tp,0,LOCATION_MZONE,1,nil,c:GetAttack())
end
function c13790611.dfilter(c,atk)
	return c:IsFaceup() and c:IsAttackBelow(atk)
end

function c13790611.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_REMOVED) and c13790611.cfilter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790611.cfilter,tp,LOCATION_REMOVED,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13790611.cfilter,tp,LOCATION_REMOVED,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13790611.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoDeck(tc,nil,2,REASON_EFFECT)
		local g=Duel.GetMatchingGroup(c13790611.dfilter,tp,0,LOCATION_MZONE,nil,tc:GetAttack())
		Duel.ChangePosition(g,POS_FACEUP_DEFENCE)
		Duel.ConfirmCards(1-tp,tc)
	end
end

function c13790611.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,1,nil)
end
function c13790611.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(-500)
		tc:RegisterEffect(e1)
	end
end