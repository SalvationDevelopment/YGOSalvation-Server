--PlayMaker Fantasia 10
function c225.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,5,3)
	c:EnableReviveLimit()
	--chain attack
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(225,0))
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_BATTLE_DESTROYING)
	e1:SetCondition(c225.atcon)
	e1:SetCost(c225.atcost)
	e1:SetOperation(c225.atop)
	c:RegisterEffect(e1)
	--Pos Change
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetDescription(aux.Stringid(225,0))
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetCondition(c225.poscon)
	e3:SetTarget(c225.postg)
	e3:SetOperation(c225.posop)
	c:RegisterEffect(e3)
end

function c225.poscon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_XYZ
end

function c225.tgfilter(c)
	return c:IsDefencePos() and c:IsFacedown()
end

function c225.postg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c225.tgfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c225.tgfilter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,g:GetCount(),0,0)
end
function c225.posop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c225.tgfilter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.ChangePosition(g,0,0,POS_FACEUP_ATTACK,POS_FACEUP_ATTACK,true)
end



function c225.atcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local bc=c:GetBattleTarget()
	return bc:IsLocation(LOCATION_GRAVE) and bc:IsReason(REASON_BATTLE) and bc:IsType(TYPE_MONSTER) and c:IsChainAttackable()
end
function c225.atcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end

function c225.filter(c,atk)
	return c:IsFaceup() and c:GetAttack()>atk
end
function c225.tga(e,c)
	if c:IsFaceup() then
		return Duel.IsExistingMatchingCard(c225.filter,c:GetControler(),LOCATION_MZONE,0,1,c,c:GetAttack())
	else return true end
end
function c225.vala(e,c)
	return c==e:GetHandler()
end

function c225.atop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToBattle() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD)
		e1:SetRange(LOCATION_MZONE)
		e1:SetTargetRange(0,LOCATION_MZONE)
		e1:SetProperty(EFFECT_FLAG_SET_AVAILABLE+EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetTarget(c225.tga)
		e1:SetValue(c225.vala)
		e:GetHandler():RegisterEffect(e1)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_CANNOT_DIRECT_ATTACK)
		e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e:GetHandler():RegisterEffect(e2)
		Duel.ChainAttack()
	end
end
