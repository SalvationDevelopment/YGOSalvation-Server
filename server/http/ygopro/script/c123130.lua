--Knight of Destiny
function c123130.initial_effect(c)
c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123130.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123130.sprcon)
	e2:SetOperation(c123130.sprop)
	c:RegisterEffect(e2)
	--indes
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e3:SetValue(1)
	c:RegisterEffect(e3)
	--atk change
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(123130,0))
	e4:SetCategory(CATEGORY_ATKCHANGE)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_ATTACK_ANNOUNCE)
	e4:SetCondition(c123130.atcon)
	e4:SetTarget(c123130.attg)
	e4:SetOperation(c123130.atop)
	c:RegisterEffect(e4)
	--chain attack
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123130,2))
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCountLimit(1)
	e5:SetCode(EVENT_BATTLE_DESTROYING)
	e5:SetCondition(c123130.zcondition)
	e5:SetOperation(c123130.zoperation)
	c:RegisterEffect(e5)	
end

c123130.material_count=3
c123130.material={12395,12396,12397}
function c123130.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123130.sprfilter(c,code)
	return c:IsCode(code) and c:IsAbleToGraveAsCost()
end
function c123130.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12395)
		and Duel.IsExistingMatchingCard(c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12396)
		and Duel.IsExistingMatchingCard(c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12397)
end
function c123130.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12395)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12396)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g3=Duel.SelectMatchingCard(tp,c123130.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12397)
	g1:Merge(g2)
	g1:Merge(g3)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.SendtoGrave(g1,nil,2,REASON_COST)
end

	
function c123130.atcon(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetBattleTarget()
	return tc and tc:IsFaceup() and tc:GetAttack()>e:GetHandler():GetAttack()
end

function c123130.attg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and chkc:IsFaceup() end
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,1,nil)
end

function c123130.atop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) and tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK)
		e1:SetValue(tc:GetAttack())
		e1:SetReset(RESET_PHASE+PHASE_BATTLE)
		c:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_SET_DEFENCE)
		e2:SetValue(tc:GetDefence())
		e2:SetReset(RESET_PHASE+PHASE_BATTLE)
		c:RegisterEffect(e2)
	end
end

function c123130.zcondition(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:GetFlagEffect(123130)==0 and c:IsChainAttackable()
end
function c123130.zoperation(e,tp,eg,ep,ev,re,r,rp)
	Duel.ChainAttack()
end