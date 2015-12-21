--ゴーストリック・ランタン
function c80600016.initial_effect(c)
	--sumlimit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80600016.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80600016.target)
	e2:SetOperation(c80600016.operation)
	c:RegisterEffect(e2)
	--negate
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80600016,0))
	e3:SetProperty(EFFECT_FLAG_CHAIN_UNIQUE)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetRange(LOCATION_HAND)
	e3:SetCondition(c80600016.negcon)
	e3:SetTarget(c80600016.negtg)
	e3:SetOperation(c80600016.negop)
	c:RegisterEffect(e3)
end
function c80600016.sumfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x91)
end
function c80600016.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80600016.sumfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80600016.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80600016)==0 end
	c:RegisterFlagEffect(80600016,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80600016.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80600016.negcon(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return at:GetControler()~=tp and Duel.GetAttackTarget()==nil or
		at:GetControler()~=tp and Duel.GetAttackTarget():IsSetCard(0x91) and Duel.GetAttackTarget():IsFaceup()
end
function c80600016.negtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,tg,1,0,0)
end
function c80600016.negop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.NegateAttack() and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEDOWN_DEFENCE)
	end
end
