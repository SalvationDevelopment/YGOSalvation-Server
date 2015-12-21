--Performapal Pinch Helper
function c13790439.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c13790439.target1)
	e1:SetOperation(c13790439.activate)
	c:RegisterEffect(e1)
	--negate
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790439,0))
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1)
	e2:SetCode(EVENT_ATTACK_ANNOUNCE)
	e2:SetCondition(c13790439.condition)
	e2:SetTarget(c13790439.target2)
	e2:SetOperation(c13790439.activate)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(13790439,1))
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetCost(c13790439.cost)
	e3:SetCondition(c13790439.condition)
	e3:SetOperation(c13790439.operation)
	c:RegisterEffect(e3)
end
function c13790439.filter(c,e,tp)
	return c:IsSetCard(0x9f) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790439.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp~=Duel.GetTurnPlayer() and Duel.GetAttackTarget()==nil
end
function c13790439.target1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return true end
	if Duel.CheckEvent(EVENT_ATTACK_ANNOUNCE) and tp~=Duel.GetTurnPlayer() and Duel.GetAttackTarget()==nil and tg:IsOnField() and tg:IsCanBeEffectTarget(e)
		and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.IsExistingMatchingCard(c13790439.filter,tp,LOCATION_DECK,0,1,nil,e,tp)
		 and Duel.SelectYesNo(tp,aux.Stringid(13790439,0)) then
		e:SetProperty(EFFECT_FLAG_CARD_TARGET)
		Duel.SetTargetCard(tg)
	else e:SetProperty(0) end
end
function c13790439.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local tg=Duel.GetAttacker()
	if chkc then return chkc==tg end
	if chk==0 then return not e:GetHandler():IsStatus(STATUS_CHAINING) and tg:IsOnField() and tg:IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(tg)
end
function c13790439.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) and Duel.IsExistingMatchingCard(c13790439.filter,tp,LOCATION_DECK,0,1,nil,e,tp) and Duel.NegateAttack() then
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13790439.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
		if Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP) then
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_DISABLE)
			e1:SetReset(RESET_EVENT+0x1fe0000)
			tc:RegisterEffect(e1)
			local e2=Effect.CreateEffect(c)
			e2:SetType(EFFECT_TYPE_SINGLE)
			e2:SetCode(EFFECT_DISABLE_EFFECT)
			e2:SetReset(RESET_EVENT+0x1fe0000)
			tc:RegisterEffect(e2)
		end
	end
	Duel.SpecialSummonComplete()
end

function c13790439.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
end
function c13790439.operation(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetReset(RESET_PHASE+PHASE_DAMAGE)
	e1:SetTargetRange(1,0)
	e1:SetValue(c13790439.damval)
	Duel.RegisterEffect(e1,tp)
end
function c13790439.damval(e,re,val,r,rp,rc)
	if r==REASON_BATTLE then
		return 0
	else return val end
end
