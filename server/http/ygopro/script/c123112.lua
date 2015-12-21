--Dark Burning Attack
function c123112.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c123112.condition)	
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c123112.cost)
	e1:SetTarget(c123112.target)
	e1:SetOperation(c123112.activate)
	c:RegisterEffect(e1)
	if not c123112.global_check then
		c123112.global_check=true
		c123112[0]=true
		c123112[1]=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_ATTACK_ANNOUNCE)
		ge1:SetOperation(c123112.checkop)
		Duel.RegisterEffect(ge1,0)
		local ge2=Effect.CreateEffect(c)
		ge2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge2:SetCode(EVENT_PHASE_START+PHASE_DRAW)
		ge2:SetOperation(c123112.clear)
		Duel.RegisterEffect(ge2,0)
	end
end
function c123112.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c123112.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	if tc:IsCode(46986414) then
		c123112[tc:GetControler()]=false
	end
end
function c123112.clear(e,tp,eg,ep,ev,re,r,rp)
	c123112[0]=true
	c123112[1]=true
end
function c123112.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return c123112[tp] end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e1:SetProperty(EFFECT_FLAG_OATH)
	e1:SetTarget(aux.TargetBoolFunction(Card.IsCode,46986414))
	e1:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e1:SetReset(RESET_PHASE+RESET_END)
	Duel.RegisterEffect(e1,tp)
end
function c123112.filter(c)
	return c:IsFaceup() and c:IsCode(46986414)
end
function c123112.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c123112.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c123112.filter,tp,LOCATION_MZONE,0,1,nil) end
	local g=Duel.SelectTarget(tp,c123112.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c123112.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.Damage(1-tp,tc:GetBaseAttack(),REASON_EFFECT)
	end
end
