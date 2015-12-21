--Aromage - Rosemary
function c13790544.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(0,1)
	e1:SetValue(c13790544.aclimit)
	e1:SetCondition(c13790544.condition)
	c:RegisterEffect(e1)	
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_RECOVER)
	e2:SetCountLimit(1)
	e2:SetCondition(c13790544.cd)
	e2:SetTarget(c13790544.postg)
	e2:SetOperation(c13790544.posop)
	c:RegisterEffect(e2)
end
function c13790544.condition(e,tp,eg,ep,ev,re,r,rp)
	local tp=e:GetHandlerPlayer()
	local tc=Duel.GetAttacker()
	if Duel.GetTurnPlayer()~=tp then return false end
	return tc and tc:IsControler(tp) and tc:IsRace(RACE_PLANT) and Duel.GetLP(tp)>Duel.GetLP(1-tp)
end
function c13790544.aclimit(e,re,tp)
	return not re:GetHandler():IsImmuneToEffect(e) and re:IsActiveType(TYPE_MONSTER)
end

function c13790544.cd(e,tp,eg,ep,ev,re,r,rp)
	return tp==ep
end
function c13790544.postg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsFaceup() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_POSCHANGE)
	local g=Duel.SelectTarget(tp,Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c13790544.posop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.ChangePosition(tc,POS_FACEUP_DEFENCE,0,POS_FACEUP_ATTACK,0)
	end
end

