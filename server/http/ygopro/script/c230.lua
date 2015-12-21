-- Hindenburg
function c230.initial_effect(c)
	--spsummon from hand
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_HAND)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetCondition(c230.hspcon)
	e1:SetOperation(c230.hspop)
	c:RegisterEffect(e1)
	--change position
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(230,1))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c230.condition)
	e3:SetTarget(c230.target)
	e3:SetOperation(c230.operation)
	c:RegisterEffect(e3)
	local e4=e3:Clone()
	e4:SetCode(EVENT_SUMMON_SUCCESS)
	c:RegisterEffect(e4)
	--Def drop
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DEFCHANGE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_CHANGE_POS)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c230.dcondition)
	e2:SetTarget(c230.dtarget)
	e2:SetOperation(c230.dop)
	c:RegisterEffect(e2)
end

function c230.hspcon(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.CheckReleaseGroup(c:GetControler(),Card.IsType,2,nil,TYPE_TOKEN)
end
function c230.hspop(e,tp,eg,ep,ev,re,r,rp,c)
	local g=Duel.SelectReleaseGroup(c:GetControler(),Card.IsType,2,2,nil,TYPE_TOKEN)
	Duel.Release(g,REASON_COST)
end

--function c230.condition(e,tp,eg,ep,ev,re,r,rp)
	--local c=eg:GetFirst()
	--return c:IsFaceup() and c:IsLevelAbove(9) and (not e)
--end

function c230.gfilter(c,tp)
	 return c:IsFaceup() and c:IsLevelAbove(10)
		
end

function c230.condition(e,tp,eg,ep,ev,re,r,rp)
	return not eg:IsContains(e:GetHandler()) and eg:IsExists(c230.gfilter,1,nil,tp)
end


function c230.filter(c)
	return c:GetPosition()~=POS_FACEUP_DEFENCE and c:IsLevelBelow(9)
end

function c230.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c230.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	local g=Duel.GetMatchingGroup(c230.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,g:GetCount(),0,0)	
end

function c230.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c230.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	Duel.ChangePosition(g,POS_FACEUP_DEFENCE,POS_FACEUP_DEFENCE,POS_FACEUP_DEFENCE,POS_FACEUP_DEFENCE)
end


function c230.cfilter(c,tp)
	return c:IsPreviousPosition(POS_FACEUP_ATTACK) and c:IsPosition(POS_FACEUP_DEFENCE)
end
function c230.dcondition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c230.cfilter,1,nil,1-tp)
end

function c230.dtarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c230.cfilter,tp,LOCATION_MZONE,LOCATION_MZONE,0,e:GetHandler()) end
	local g=Duel.GetMatchingGroup(c230.cfilter,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,g:GetCount(),0,0)
end


function c230.dop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c230.cfilter,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	local tc= g:GetFirst()
	while tc do
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_DEFENCE_FINAL)
		e1:SetValue(0)
		tc:RegisterEffect(e1)
		tc=g:GetNext()
	
end
end